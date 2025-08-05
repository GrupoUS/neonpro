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
exports.default = SearchAndFilters;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var popover_1 = require("@/components/ui/popover");
var select_1 = require("@/components/ui/select");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Componente principal de Busca e Filtros
function SearchAndFilters(_a) {
  var _b, _c;
  var onFiltersChange = _a.onFiltersChange,
    vendors = _a.vendors,
    categories = _a.categories,
    initialFilters = _a.initialFilters,
    _d = _a.showQuickActions,
    showQuickActions = _d === void 0 ? true : _d,
    _e = _a.className,
    className = _e === void 0 ? "" : _e;
  // Estados dos filtros
  var _f = (0, react_1.useState)(
      __assign(
        {
          searchQuery: "",
          overdue_only: false,
          approved_only: false,
          due_this_week: false,
          tags: [],
        },
        initialFilters,
      ),
    ),
    filters = _f[0],
    setFilters = _f[1];
  // Estados da UI
  var _g = (0, react_1.useState)(false),
    showAdvancedFilters = _g[0],
    setShowAdvancedFilters = _g[1];
  var _h = (0, react_1.useState)([]),
    savedFilters = _h[0],
    setSavedFilters = _h[1];
  var _j = (0, react_1.useState)(""),
    saveFilterName = _j[0],
    setSaveFilterName = _j[1];
  var _k = (0, react_1.useState)(false),
    showSaveDialog = _k[0],
    setShowSaveDialog = _k[1];
  // Estados de calendário
  var _l = (0, react_1.useState)(
      (_b = filters.date_range) === null || _b === void 0 ? void 0 : _b.start,
    ),
    startDate = _l[0],
    setStartDate = _l[1];
  var _m = (0, react_1.useState)(
      (_c = filters.date_range) === null || _c === void 0 ? void 0 : _c.end,
    ),
    endDate = _m[0],
    setEndDate = _m[1];
  var _o = (0, react_1.useState)(false),
    showStartCalendar = _o[0],
    setShowStartCalendar = _o[1];
  var _p = (0, react_1.useState)(false),
    showEndCalendar = _p[0],
    setShowEndCalendar = _p[1];
  // Opções de status
  var statusOptions = [
    { value: "pending", label: "Pendente", count: 12 },
    { value: "approved", label: "Aprovado", count: 8 },
    { value: "paid", label: "Pago", count: 25 },
    { value: "overdue", label: "Em Atraso", count: 4 },
    { value: "cancelled", label: "Cancelado", count: 2 },
  ];
  // Opções de método de pagamento
  var paymentMethodOptions = [
    { value: "bank_transfer", label: "Transferência Bancária" },
    { value: "pix", label: "PIX" },
    { value: "cash", label: "Dinheiro" },
    { value: "check", label: "Cheque" },
    { value: "credit_card", label: "Cartão de Crédito" },
  ];
  // Atualizar filtros e notificar componente pai
  var updateFilters = (0, react_1.useCallback)(
    (newFilters) => {
      var updatedFilters = __assign(__assign({}, filters), newFilters);
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange],
  );
  // Handler para busca de texto
  var handleSearchChange = (0, react_1.useCallback)(
    (query) => {
      updateFilters({ searchQuery: query });
    },
    [updateFilters],
  );
  // Handler para filtros de data
  var handleDateRangeChange = () => {
    if (startDate && endDate) {
      updateFilters({
        date_range: { start: startDate, end: endDate },
      });
    } else {
      updateFilters({ date_range: undefined });
    }
  };
  // Handler para filtros de valor
  var handleAmountRangeChange = (min, max) => {
    var minValue = min ? parseFloat(min) : undefined;
    var maxValue = max ? parseFloat(max) : undefined;
    if (minValue !== undefined || maxValue !== undefined) {
      updateFilters({
        amount_range: {
          min: minValue || 0,
          max: maxValue || Number.MAX_SAFE_INTEGER,
        },
      });
    } else {
      updateFilters({ amount_range: undefined });
    }
  };
  // Handler para tags
  var handleTagAdd = (tag) => {
    var currentTags = filters.tags || [];
    if (!currentTags.includes(tag)) {
      updateFilters({ tags: __spreadArray(__spreadArray([], currentTags, true), [tag], false) });
    }
  };
  var handleTagRemove = (tag) => {
    var currentTags = filters.tags || [];
    updateFilters({
      tags: currentTags.filter((t) => t !== tag),
    });
  };
  // Limpar filtros
  var clearFilters = () => {
    var clearedFilters = {
      searchQuery: "",
      overdue_only: false,
      approved_only: false,
      due_this_week: false,
      tags: [],
    };
    setFilters(clearedFilters);
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange(clearedFilters);
  };
  // Salvar filtro atual
  var saveCurrentFilter = () => {
    if (!saveFilterName.trim()) return;
    var newFilter = {
      id: Date.now().toString(),
      name: saveFilterName,
      filters: __assign({}, filters),
      is_default: false,
      created_at: new Date().toISOString(),
    };
    setSavedFilters(__spreadArray(__spreadArray([], savedFilters, true), [newFilter], false));
    setSaveFilterName("");
    setShowSaveDialog(false);
  };
  // Carregar filtro salvo
  var loadSavedFilter = (savedFilter) => {
    var _a, _b;
    setFilters(savedFilter.filters);
    setStartDate(
      (_a = savedFilter.filters.date_range) === null || _a === void 0 ? void 0 : _a.start,
    );
    setEndDate((_b = savedFilter.filters.date_range) === null || _b === void 0 ? void 0 : _b.end);
    onFiltersChange(savedFilter.filters);
  };
  // Exportar resultados
  var exportResults = (format) => {
    console.log("Exporting results as ".concat(format, "..."));
    // Implementar exportação
  };
  // Effect para atualizar data range
  (0, react_1.useEffect)(() => {
    handleDateRangeChange();
  }, [startDate, endDate]);
  // Contar filtros ativos
  var activeFiltersCount = Object.entries(filters).filter((_a) => {
    var key = _a[0],
      value = _a[1];
    if (key === "searchQuery") return value && value.trim().length > 0;
    if (key === "tags") return Array.isArray(value) && value.length > 0;
    if (key === "date_range" || key === "amount_range") return value !== undefined;
    return value && value !== "" && value !== false;
  }).length;
  return (
    <div className={"space-y-4 ".concat(className)}>
      {/* Barra de Busca Principal */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input_1.Input
                placeholder="Buscar por fornecedor, número da fatura, descrição..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <button_1.Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2"
            >
              <lucide_react_1.SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <badge_1.Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </badge_1.Badge>
              )}
              <lucide_react_1.ChevronDown
                className={"h-4 w-4 transition-transform ".concat(
                  showAdvancedFilters ? "rotate-180" : "",
                )}
              />
            </button_1.Button>
          </div>

          {/* Filtros Rápidos */}
          <div className="flex items-center space-x-2 mt-4">
            <button_1.Button
              variant={filters.overdue_only ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ overdue_only: !filters.overdue_only })}
            >
              Em Atraso
            </button_1.Button>
            <button_1.Button
              variant={filters.due_this_week ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ due_this_week: !filters.due_this_week })}
            >
              Vence esta Semana
            </button_1.Button>
            <button_1.Button
              variant={filters.approved_only ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ approved_only: !filters.approved_only })}
            >
              Aprovados
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center justify-between">
              <span>Filtros Avançados</span>
              <div className="flex items-center space-x-2">
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <lucide_react_1.BookmarkPlus className="h-4 w-4 mr-2" />
                  Salvar Filtros
                </button_1.Button>
                <button_1.Button variant="outline" size="sm" onClick={clearFilters}>
                  <lucide_react_1.X className="h-4 w-4 mr-2" />
                  Limpar
                </button_1.Button>
              </div>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fornecedor */}
              <div className="space-y-2">
                <label_1.Label>Fornecedor</label_1.Label>
                <select_1.Select
                  value={filters.vendor_id || ""}
                  onValueChange={(value) => updateFilters({ vendor_id: value || undefined })}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Todos os fornecedores" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="">Todos os fornecedores</select_1.SelectItem>
                    {vendors.map((vendor) => (
                      <select_1.SelectItem key={vendor.value} value={vendor.value}>
                        {vendor.label} {vendor.count && "(".concat(vendor.count, ")")}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <label_1.Label>Categoria</label_1.Label>
                <select_1.Select
                  value={filters.category_id || ""}
                  onValueChange={(value) => updateFilters({ category_id: value || undefined })}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Todas as categorias" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="">Todas as categorias</select_1.SelectItem>
                    {categories.map((category) => (
                      <select_1.SelectItem key={category.value} value={category.value}>
                        {category.label} {category.count && "(".concat(category.count, ")")}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label_1.Label>Status</label_1.Label>
                <select_1.Select
                  value={filters.status || ""}
                  onValueChange={(value) => updateFilters({ status: value || undefined })}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Todos os status" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="">Todos os status</select_1.SelectItem>
                    {statusOptions.map((status) => (
                      <select_1.SelectItem key={status.value} value={status.value}>
                        {status.label} {status.count && "(".concat(status.count, ")")}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Método de Pagamento */}
              <div className="space-y-2">
                <label_1.Label>Método de Pagamento</label_1.Label>
                <select_1.Select
                  value={filters.payment_method || ""}
                  onValueChange={(value) => updateFilters({ payment_method: value || undefined })}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Todos os métodos" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="">Todos os métodos</select_1.SelectItem>
                    {paymentMethodOptions.map((method) => (
                      <select_1.SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Data de Início */}
              <div className="space-y-2">
                <label_1.Label>Data de Início</label_1.Label>
                <popover_1.Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <popover_1.PopoverTrigger asChild>
                    <button_1.Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? (0, date_fns_1.format)(startDate, "dd/MM/yyyy", { locale: locale_1.ptBR })
                        : "Selecionar data"}
                    </button_1.Button>
                  </popover_1.PopoverTrigger>
                  <popover_1.PopoverContent className="w-auto p-0" align="start">
                    <calendar_1.Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setShowStartCalendar(false);
                      }}
                      locale={locale_1.ptBR}
                    />
                  </popover_1.PopoverContent>
                </popover_1.Popover>
              </div>

              {/* Data de Fim */}
              <div className="space-y-2">
                <label_1.Label>Data de Fim</label_1.Label>
                <popover_1.Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                  <popover_1.PopoverTrigger asChild>
                    <button_1.Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? (0, date_fns_1.format)(endDate, "dd/MM/yyyy", { locale: locale_1.ptBR })
                        : "Selecionar data"}
                    </button_1.Button>
                  </popover_1.PopoverTrigger>
                  <popover_1.PopoverContent className="w-auto p-0" align="start">
                    <calendar_1.Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setShowEndCalendar(false);
                      }}
                      locale={locale_1.ptBR}
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </popover_1.PopoverContent>
                </popover_1.Popover>
              </div>
            </div>

            {/* Filtro de Valores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label>Valor Mínimo</label_1.Label>
                <input_1.Input
                  type="number"
                  placeholder="0,00"
                  onChange={(e) => {
                    var _a, _b;
                    return handleAmountRangeChange(
                      e.target.value,
                      ((_b =
                        (_a = filters.amount_range) === null || _a === void 0 ? void 0 : _a.max) ===
                        null || _b === void 0
                        ? void 0
                        : _b.toString()) || "",
                    );
                  }}
                />
              </div>
              <div className="space-y-2">
                <label_1.Label>Valor Máximo</label_1.Label>
                <input_1.Input
                  type="number"
                  placeholder="999999,99"
                  onChange={(e) => {
                    var _a, _b;
                    return handleAmountRangeChange(
                      ((_b =
                        (_a = filters.amount_range) === null || _a === void 0 ? void 0 : _a.min) ===
                        null || _b === void 0
                        ? void 0
                        : _b.toString()) || "",
                      e.target.value,
                    );
                  }}
                />
              </div>
            </div>

            {/* Tags/Etiquetas */}
            <div className="space-y-2">
              <label_1.Label>Tags</label_1.Label>
              <div className="flex flex-wrap gap-2">
                {(filters.tags || []).map((tag) => (
                  <badge_1.Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <lucide_react_1.X className="h-3 w-3" />
                    </button>
                  </badge_1.Badge>
                ))}
                <input_1.Input
                  placeholder="Adicionar tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      handleTagAdd(e.currentTarget.value.trim());
                      e.currentTarget.value = "";
                    }
                  }}
                  className="flex-1 min-w-[200px]"
                />
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Filtros Salvos */}
      {savedFilters.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Filtros Salvos</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((savedFilter) => (
                <button_1.Button
                  key={savedFilter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSavedFilter(savedFilter)}
                  className="flex items-center space-x-2"
                >
                  <span>{savedFilter.name}</span>
                  {savedFilter.is_default && (
                    <badge_1.Badge variant="secondary" className="text-xs">
                      Padrão
                    </badge_1.Badge>
                  )}
                </button_1.Button>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Ações Rápidas */}
      {showQuickActions && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Ações Rápidas</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex items-center space-x-2">
              <button_1.Button variant="outline" size="sm" onClick={() => exportResults("csv")}>
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </button_1.Button>
              <button_1.Button variant="outline" size="sm" onClick={() => exportResults("excel")}>
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </button_1.Button>
              <button_1.Button variant="outline" size="sm" onClick={() => exportResults("pdf")}>
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Dialog para Salvar Filtro */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Salvar Filtros</h3>
            <div className="space-y-4">
              <div>
                <label_1.Label htmlFor="filter-name">Nome do Filtro</label_1.Label>
                <input_1.Input
                  id="filter-name"
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  placeholder="Ex: Faturas em atraso"
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button_1.Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={saveCurrentFilter} disabled={!saveFilterName.trim()}>
                  Salvar
                </button_1.Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

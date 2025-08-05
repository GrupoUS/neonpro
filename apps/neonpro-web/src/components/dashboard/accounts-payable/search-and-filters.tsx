"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  BookmarkPlus,
  CalendarIcon,
  ChevronDown,
  Download,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { useCallback, useEffect, useState } from "react";

// Tipos para filtros
export interface SearchFilters {
  searchQuery: string;
  vendor_id?: string;
  category_id?: string;
  status?: string;
  payment_method?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  amount_range?: {
    min: number;
    max: number;
  };
  overdue_only: boolean;
  approved_only: boolean;
  due_this_week: boolean;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: SearchFilters;
  is_default: boolean;
  created_at: string;
}

interface SearchAndFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  vendors: FilterOption[];
  categories: FilterOption[];
  initialFilters?: SearchFilters;
  showQuickActions?: boolean;
  className?: string;
}

// Componente principal de Busca e Filtros
export default function SearchAndFilters({
  onFiltersChange,
  vendors,
  categories,
  initialFilters,
  showQuickActions = true,
  className = "",
}: SearchAndFiltersProps) {
  // Estados dos filtros
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: "",
    overdue_only: false,
    approved_only: false,
    due_this_week: false,
    tags: [],
    ...initialFilters,
  });

  // Estados da UI
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Estados de calendário
  const [startDate, setStartDate] = useState<Date | undefined>(filters.date_range?.start);
  const [endDate, setEndDate] = useState<Date | undefined>(filters.date_range?.end);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Opções de status
  const statusOptions: FilterOption[] = [
    { value: "pending", label: "Pendente", count: 12 },
    { value: "approved", label: "Aprovado", count: 8 },
    { value: "paid", label: "Pago", count: 25 },
    { value: "overdue", label: "Em Atraso", count: 4 },
    { value: "cancelled", label: "Cancelado", count: 2 },
  ];

  // Opções de método de pagamento
  const paymentMethodOptions: FilterOption[] = [
    { value: "bank_transfer", label: "Transferência Bancária" },
    { value: "pix", label: "PIX" },
    { value: "cash", label: "Dinheiro" },
    { value: "check", label: "Cheque" },
    { value: "credit_card", label: "Cartão de Crédito" },
  ];

  // Atualizar filtros e notificar componente pai
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  // Handler para busca de texto
  const handleSearchChange = useCallback(
    (query: string) => {
      updateFilters({ searchQuery: query });
    },
    [updateFilters],
  );

  // Handler para filtros de data
  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      updateFilters({
        date_range: { start: startDate, end: endDate },
      });
    } else {
      updateFilters({ date_range: undefined });
    }
  };

  // Handler para filtros de valor
  const handleAmountRangeChange = (min: string, max: string) => {
    const minValue = min ? parseFloat(min) : undefined;
    const maxValue = max ? parseFloat(max) : undefined;

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
  const handleTagAdd = (tag: string) => {
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag)) {
      updateFilters({ tags: [...currentTags, tag] });
    }
  };

  const handleTagRemove = (tag: string) => {
    const currentTags = filters.tags || [];
    updateFilters({ tags: currentTags.filter((t) => t !== tag) });
  };

  // Limpar filtros
  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
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
  const saveCurrentFilter = () => {
    if (!saveFilterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: saveFilterName,
      filters: { ...filters },
      is_default: false,
      created_at: new Date().toISOString(),
    };

    setSavedFilters([...savedFilters, newFilter]);
    setSaveFilterName("");
    setShowSaveDialog(false);
  };

  // Carregar filtro salvo
  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    setStartDate(savedFilter.filters.date_range?.start);
    setEndDate(savedFilter.filters.date_range?.end);
    onFiltersChange(savedFilter.filters);
  };

  // Exportar resultados
  const exportResults = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting results as ${format}...`);
    // Implementar exportação
  };

  // Effect para atualizar data range
  useEffect(() => {
    handleDateRangeChange();
  }, [startDate, endDate]);

  // Contar filtros ativos
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "searchQuery") return value && value.trim().length > 0;
    if (key === "tags") return Array.isArray(value) && value.length > 0;
    if (key === "date_range" || key === "amount_range") return value !== undefined;
    return value && value !== "" && value !== false;
  }).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de Busca Principal */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por fornecedor, número da fatura, descrição..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showAdvancedFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* Filtros Rápidos */}
          <div className="flex items-center space-x-2 mt-4">
            <Button
              variant={filters.overdue_only ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ overdue_only: !filters.overdue_only })}
            >
              Em Atraso
            </Button>
            <Button
              variant={filters.due_this_week ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ due_this_week: !filters.due_this_week })}
            >
              Vence esta Semana
            </Button>
            <Button
              variant={filters.approved_only ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ approved_only: !filters.approved_only })}
            >
              Aprovados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros Avançados</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Salvar Filtros
                </Button>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fornecedor */}
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select
                  value={filters.vendor_id || ""}
                  onValueChange={(value) => updateFilters({ vendor_id: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os fornecedores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os fornecedores</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.value} value={vendor.value}>
                        {vendor.label} {vendor.count && `(${vendor.count})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={filters.category_id || ""}
                  onValueChange={(value) => updateFilters({ category_id: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label} {category.count && `(${category.count})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => updateFilters({ status: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label} {status.count && `(${status.count})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Método de Pagamento */}
              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <Select
                  value={filters.payment_method || ""}
                  onValueChange={(value) => updateFilters({ payment_method: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os métodos</SelectItem>
                    {paymentMethodOptions.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data de Início */}
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "dd/MM/yyyy", { locale: ptBR })
                        : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setShowStartCalendar(false);
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data de Fim */}
              <div className="space-y-2">
                <Label>Data de Fim</Label>
                <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? format(endDate, "dd/MM/yyyy", { locale: ptBR })
                        : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setShowEndCalendar(false);
                      }}
                      locale={ptBR}
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filtro de Valores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Mínimo</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  onChange={(e) =>
                    handleAmountRangeChange(
                      e.target.value,
                      filters.amount_range?.max?.toString() || "",
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Máximo</Label>
                <Input
                  type="number"
                  placeholder="999999,99"
                  onChange={(e) =>
                    handleAmountRangeChange(
                      filters.amount_range?.min?.toString() || "",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            {/* Tags/Etiquetas */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {(filters.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
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
          </CardContent>
        </Card>
      )}

      {/* Filtros Salvos */}
      {savedFilters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros Salvos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((savedFilter) => (
                <Button
                  key={savedFilter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSavedFilter(savedFilter)}
                  className="flex items-center space-x-2"
                >
                  <span>{savedFilter.name}</span>
                  {savedFilter.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      Padrão
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      {showQuickActions && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => exportResults("csv")}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportResults("excel")}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportResults("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para Salvar Filtro */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Salvar Filtros</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filter-name">Nome do Filtro</Label>
                <Input
                  id="filter-name"
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  placeholder="Ex: Faturas em atraso"
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveCurrentFilter} disabled={!saveFilterName.trim()}>
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

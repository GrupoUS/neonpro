"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AlertTriangle,
  Bot,
  Calculator,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";
import type { useMemo, useState } from "react";

interface ReorderSuggestion {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;

  // Análise preditiva
  averageConsumption: number; // por mês
  consumptionTrend: "increasing" | "stable" | "decreasing";
  seasonalFactor: number; // multiplicador sazonal
  leadTime: number; // dias para entrega
  safetyStock: number;

  // Sugestão de pedido
  suggestedQuantity: number;
  suggestedOrderDate: string;
  urgency: "critical" | "high" | "medium" | "low";

  // Fornecedor e custos
  preferredSupplierId: string;
  preferredSupplierName: string;
  unitCost: number;
  totalCost: number;
  minOrderQuantity: number;
  bulkDiscountAvailable: boolean;
  bulkDiscountTier?: { quantity: number; discount: number };

  // Histórico e análise
  lastOrderDate?: string;
  lastOrderQuantity?: number;
  stockoutRisk: number; // 0-100%
  daysUntilStockout: number;

  // Compliance
  temperatureControlled: boolean;
  anvisaRegistration?: string;
  shelfLife: number; // meses

  // Status
  status: "suggested" | "approved" | "ordered" | "received" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  orderNumber?: string;
}

// Mock data for demonstration
const mockReorderSuggestions: ReorderSuggestion[] = [
  {
    productId: "PRD001",
    productName: "Botox Allergan 100U",
    category: "botox",
    currentStock: 8,
    minStock: 10,
    maxStock: 50,
    unit: "frasco",
    averageConsumption: 12,
    consumptionTrend: "increasing",
    seasonalFactor: 1.2,
    leadTime: 5,
    safetyStock: 3,
    suggestedQuantity: 25,
    suggestedOrderDate: "2024-11-18",
    urgency: "critical",
    preferredSupplierId: "SUP001",
    preferredSupplierName: "Medfarma Distribuidora",
    unitCost: 650.0,
    totalCost: 16250.0,
    minOrderQuantity: 10,
    bulkDiscountAvailable: true,
    bulkDiscountTier: { quantity: 20, discount: 5 },
    lastOrderDate: "2024-10-15",
    lastOrderQuantity: 30,
    stockoutRisk: 85,
    daysUntilStockout: 3,
    temperatureControlled: true,
    anvisaRegistration: "10295770028",
    shelfLife: 24,
    status: "suggested",
  },
  {
    productId: "PRD002",
    productName: "Ácido Hialurônico Juvederm Ultra",
    category: "fillers",
    currentStock: 12,
    minStock: 8,
    maxStock: 40,
    unit: "seringa",
    averageConsumption: 8,
    consumptionTrend: "stable",
    seasonalFactor: 1.0,
    leadTime: 3,
    safetyStock: 2,
    suggestedQuantity: 20,
    suggestedOrderDate: "2024-11-25",
    urgency: "medium",
    preferredSupplierId: "SUP002",
    preferredSupplierName: "Beauty Supply LTDA",
    unitCost: 950.0,
    totalCost: 19000.0,
    minOrderQuantity: 5,
    bulkDiscountAvailable: false,
    lastOrderDate: "2024-11-01",
    lastOrderQuantity: 15,
    stockoutRisk: 35,
    daysUntilStockout: 18,
    temperatureControlled: true,
    anvisaRegistration: "10295770029",
    shelfLife: 18,
    status: "suggested",
  },
];

const urgencyConfig = {
  critical: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Crítico",
    icon: AlertTriangle,
    bgColor: "bg-red-50",
  },
  high: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Alto",
    icon: Clock,
    bgColor: "bg-orange-50",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Médio",
    icon: Package,
    bgColor: "bg-yellow-50",
  },
  low: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Baixo",
    icon: CheckCircle,
    bgColor: "bg-green-50",
  },
};

/**
 * Reorder Management Component for NeonPro Inventory System
 *
 * Features:
 * - AI-powered predictive analysis for reorder suggestions
 * - Seasonal consumption pattern analysis
 * - Lead time and safety stock calculations
 * - Supplier optimization with bulk discount analysis
 * - Stockout risk assessment and prevention
 * - Brazilian healthcare compliance (ANVISA, temperature control)
 * - Automated approval workflow
 * - Integration with purchase order system
 * - Cost optimization recommendations
 *
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
export function ReorderManagement() {
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isBulkOrderOpen, setIsBulkOrderOpen] = useState(false);

  const filteredSuggestions = useMemo(() => {
    return mockReorderSuggestions.filter((suggestion) => {
      const matchesUrgency = selectedUrgency === "all" || suggestion.urgency === selectedUrgency;
      const matchesCategory =
        selectedCategory === "all" || suggestion.category === selectedCategory;
      return matchesUrgency && matchesCategory;
    });
  }, [selectedUrgency, selectedCategory]);

  const summaryMetrics = useMemo(() => {
    const totalSuggestions = filteredSuggestions.length;
    const criticalCount = filteredSuggestions.filter((s) => s.urgency === "critical").length;
    const totalValue = filteredSuggestions.reduce((sum, s) => sum + s.totalCost, 0);
    const avgStockoutRisk =
      filteredSuggestions.reduce((sum, s) => sum + s.stockoutRisk, 0) / totalSuggestions || 0;

    return {
      totalSuggestions,
      criticalCount,
      totalValue,
      avgStockoutRisk,
    };
  }, [filteredSuggestions]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "decreasing":
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
    }
  };

  const handleSuggestionSelect = (suggestionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuggestions([...selectedSuggestions, suggestionId]);
    } else {
      setSelectedSuggestions(selectedSuggestions.filter((id) => id !== suggestionId));
    }
  };

  const handleApproveSelected = () => {
    // In a real implementation, this would update the database
    console.log("Approving suggestions:", selectedSuggestions);
    setSelectedSuggestions([]);
  };

  const handleGeneratePO = () => {
    // In a real implementation, this would generate purchase orders
    console.log("Generating purchase orders for approved suggestions");
    setIsBulkOrderOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sugestões Ativas</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalSuggestions}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{summaryMetrics.criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summaryMetrics.totalValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risco Médio</p>
                <p className="text-2xl font-bold text-amber-600">
                  {summaryMetrics.avgStockoutRisk.toFixed(1)}%
                </p>
              </div>
              <Calculator className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Urgência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="botox">💉 Toxina Botulínica</SelectItem>
            <SelectItem value="fillers">🧪 Preenchedores</SelectItem>
            <SelectItem value="skincare">✨ Dermocosméticos</SelectItem>
            <SelectItem value="equipment">⚕️ Equipamentos</SelectItem>
            <SelectItem value="consumables">🧤 Descartáveis</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          {selectedSuggestions.length > 0 && (
            <Button onClick={handleApproveSelected}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprovar Selecionados ({selectedSuggestions.length})
            </Button>
          )}

          <Dialog open={isBulkOrderOpen} onOpenChange={setIsBulkOrderOpen}>
            <DialogTrigger asChild>
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Pedido em Lote
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Gerar Pedido em Lote</DialogTitle>
                <DialogDescription>
                  Consolidar sugestões aprovadas em pedidos de compra
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Sistema gerará pedidos otimizados por fornecedor com aprovação automática...
                </p>
              </div>

              <DialogFooter>
                <Button onClick={handleGeneratePO}>Gerar Pedidos</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>{" "}
      {/* Reorder Suggestions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sugestões de Reposição ({filteredSuggestions.length})</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Bot className="w-3 h-3 mr-1" />
                IA Preditiva
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Análise inteligente com previsão de demanda e otimização de custos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSuggestions.length === filteredSuggestions.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSuggestions(filteredSuggestions.map((s) => s.productId));
                        } else {
                          setSelectedSuggestions([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Análise Preditiva</TableHead>
                  <TableHead>Sugestão</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead>Urgência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuggestions.map((suggestion) => {
                  const urgencyConfig_ = urgencyConfig[suggestion.urgency];
                  const UrgencyIcon = urgencyConfig_.icon;
                  const isSelected = selectedSuggestions.includes(suggestion.productId);

                  return (
                    <TableRow key={suggestion.productId} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSuggestionSelect(suggestion.productId, checked as boolean)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{suggestion.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {suggestion.productId}
                          </div>
                          {suggestion.temperatureControlled && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              Refrigerado
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {suggestion.currentStock} {suggestion.unit}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              / {suggestion.maxStock} max
                            </div>
                          </div>
                          <Progress
                            value={(suggestion.currentStock / suggestion.maxStock) * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground">
                            Mín: {suggestion.minStock} {suggestion.unit}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            {getTrendIcon(suggestion.consumptionTrend)}
                            <span>
                              {suggestion.averageConsumption} {suggestion.unit}
                              /mês
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tendência:{" "}
                            {suggestion.consumptionTrend === "increasing"
                              ? "Crescente"
                              : suggestion.consumptionTrend === "decreasing"
                                ? "Decrescente"
                                : "Estável"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sazonal: {(suggestion.seasonalFactor * 100).toFixed(0)}%
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-medium text-green-600">
                            {suggestion.suggestedQuantity} {suggestion.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Pedir até: {formatDate(suggestion.suggestedOrderDate)}
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(suggestion.totalCost)}
                          </div>
                          {suggestion.bulkDiscountAvailable && suggestion.bulkDiscountTier && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              {suggestion.bulkDiscountTier.discount}% desc. &gt;{" "}
                              {suggestion.bulkDiscountTier.quantity}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {suggestion.preferredSupplierName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Lead time: {suggestion.leadTime} dias
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min. pedido: {suggestion.minOrderQuantity} {suggestion.unit}
                          </div>
                          {suggestion.lastOrderDate && (
                            <div className="text-xs text-muted-foreground">
                              Último: {formatDate(suggestion.lastOrderDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Progress value={suggestion.stockoutRisk} className="h-2 w-20" />
                            <span className="text-sm font-medium text-red-600">
                              {suggestion.stockoutRisk}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ruptura em {suggestion.daysUntilStockout} dias
                          </div>
                          {suggestion.stockoutRisk > 70 && (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 text-xs"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Alto Risco
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={urgencyConfig_.color}>
                          <UrgencyIcon className="w-3 h-3 mr-1" />
                          {urgencyConfig_.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredSuggestions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma sugestão de reposição com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* AI Insights and Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Insights da IA
            </CardTitle>
            <CardDescription>Análise inteligente dos padrões de consumo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Tendência de Consumo</span>
                </div>
                <p className="text-sm text-blue-700">
                  Produtos de toxina botulínica apresentam crescimento de 15% no consumo mensal.
                  Considere aumentar estoque de segurança.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Sazonalidade</span>
                </div>
                <p className="text-sm text-amber-700">
                  Dezembro apresenta aumento de 20% na demanda por procedimentos estéticos. Ajuste
                  automático aplicado nas sugestões.
                </p>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Otimização de Custos</span>
                </div>
                <p className="text-sm text-green-700">
                  Identificados descontos de 5-8% para pedidos em lote. Potencial economia de{" "}
                  {formatCurrency(2450)} este mês.
                </p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Estoque de Segurança</span>
                </div>
                <p className="text-sm text-purple-700">
                  Recomendado aumento de 10% no estoque de segurança para produtos com controle de
                  temperatura devido ao prazo de entrega.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Performance de Fornecedores
            </CardTitle>
            <CardDescription>Análise de desempenho e recomendações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Medfarma Distribuidora</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Excelente
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Pontualidade:</span>
                    <span>98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualidade:</span>
                    <span>4.9/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço:</span>
                    <span>Competitivo</span>
                  </div>
                </div>
                <Progress value={95} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Beauty Supply LTDA</span>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Bom
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Pontualidade:</span>
                    <span>85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualidade:</span>
                    <span>4.5/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço:</span>
                    <span>Econômico</span>
                  </div>
                </div>
                <Progress value={78} className="h-2" />
              </div>

              {/* Recommendations */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Recomendações
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Priorizar Medfarma para produtos críticos</li>
                  <li>• Negociar melhores prazos com Beauty Supply</li>
                  <li>• Considerar fornecedor alternativo para backup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Automated Workflow Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Status do Workflow Automatizado
          </CardTitle>
          <CardDescription>Progresso das sugestões aprovadas e pedidos gerados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-muted-foreground">Sugestões Geradas</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <div className="text-sm text-muted-foreground">Aguardando Aprovação</div>
            </div>

            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-muted-foreground">Pedidos Enviados</div>
            </div>

            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <div className="text-sm text-muted-foreground">Recebidos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

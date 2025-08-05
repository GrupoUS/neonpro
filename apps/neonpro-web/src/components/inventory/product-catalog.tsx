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
import type { Input } from "@/components/ui/input";
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
  CheckCircle,
  Clock,
  Package,
  Plus,
  Search,
  Shield,
  Thermometer,
} from "lucide-react";
import type { useMemo, useState } from "react";

interface Product {
  id: string;
  name: string;
  category: "botox" | "fillers" | "skincare" | "equipment" | "consumables";
  brand: string;
  ncmCode: string;
  anvisaRegistration?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  unitCost: number;
  unit: string;
  location: string;
  temperatureControlled: boolean;
  controlledSubstance: boolean;
  expirationDate?: string;
  batchNumber?: string;
  supplier: string;
  supplierCnpj: string;
  status: "active" | "inactive" | "discontinued";
}

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: "PRD001",
    name: "Botox Allergan 100U",
    category: "botox",
    brand: "Allergan",
    ncmCode: "30042000",
    anvisaRegistration: "10295770028",
    currentStock: 15,
    minStock: 10,
    maxStock: 50,
    unitPrice: 890.0,
    unitCost: 650.0,
    unit: "frasco",
    location: "Geladeira A1-03",
    temperatureControlled: true,
    controlledSubstance: true,
    expirationDate: "2024-12-15",
    batchNumber: "BT240915",
    supplier: "Medfarma Distribuidora",
    supplierCnpj: "12.345.678/0001-90",
    status: "active",
  },
  {
    id: "PRD002",
    name: "Ácido Hialurônico Juvederm Ultra 3",
    category: "fillers",
    brand: "Allergan",
    ncmCode: "30042000",
    anvisaRegistration: "10295770029",
    currentStock: 8,
    minStock: 5,
    maxStock: 30,
    unitPrice: 1250.0,
    unitCost: 950.0,
    unit: "seringa",
    location: "Geladeira A1-04",
    temperatureControlled: true,
    controlledSubstance: false,
    expirationDate: "2025-03-20",
    batchNumber: "JV241020",
    supplier: "Beauty Supply LTDA",
    supplierCnpj: "23.456.789/0001-01",
    status: "active",
  },
];

const categories = [
  {
    id: "botox",
    name: "Toxina Botulínica",
    icon: "💉",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "fillers",
    name: "Preenchedores",
    icon: "🧪",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "skincare",
    name: "Dermocosméticos",
    icon: "✨",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "equipment",
    name: "Equipamentos",
    icon: "⚕️",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "consumables",
    name: "Descartáveis",
    icon: "🧤",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
];

/**
 * Product Catalog Component for NeonPro Inventory Management
 *
 * Features:
 * - Multi-category product management (botox, fillers, skincare, equipment, consumables)
 * - ANVISA registration tracking for medical devices
 * - Temperature-controlled storage indicators
 * - Controlled substance tracking (botox, prescription items)
 * - Brazilian tax compliance (NCM codes)
 * - Stock level monitoring with visual indicators
 * - Search and filtering capabilities
 *
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
export function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ncmCode.includes(searchTerm);

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.minStock) {
      return {
        status: "low",
        color: "text-red-600 bg-red-50 border-red-200",
        icon: AlertTriangle,
      };
    }
    if (product.currentStock >= product.maxStock * 0.8) {
      return {
        status: "high",
        color: "text-green-600 bg-green-50 border-green-200",
        icon: CheckCircle,
      };
    }
    return {
      status: "normal",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      icon: Package,
    };
  };

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar produtos por nome, marca ou NCM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="discontinued">Descontinuado</SelectItem>
          </SelectContent>
        </Select>

        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>
      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((category) => {
          const categoryCount = mockProducts.filter(
            (p) => p.category === category.id && p.status === "active",
          ).length;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-colors hover:shadow-md ${
                selectedCategory === category.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() =>
                setSelectedCategory(selectedCategory === category.id ? "all" : category.id)
              }
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm mb-1">{category.name}</div>
                <Badge variant="outline" className={category.color}>
                  {categoryCount} itens
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>{" "}
      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Produtos ({filteredProducts.length})</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="w-3 h-3 mr-1" />
                ANVISA Compliant
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Catálogo completo com controle de estoque e compliance regulatório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const StockIcon = stockStatus.icon;
                  const category = categories.find((c) => c.id === product.category);
                  const expiringSoon = isExpiringSoon(product.expirationDate);

                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.brand} • NCM: {product.ncmCode}
                          </div>
                          {product.anvisaRegistration && (
                            <div className="text-xs text-blue-600">
                              ANVISA: {product.anvisaRegistration}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={category?.color}>
                          {category?.icon} {category?.name}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={stockStatus.color}>
                            <StockIcon className="w-3 h-3 mr-1" />
                            {product.currentStock} {product.unit}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            Min: {product.minStock}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          {product.temperatureControlled && (
                            <Thermometer className="w-3 h-3 text-blue-500" />
                          )}
                          <span className="text-sm">{product.location}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {product.expirationDate ? (
                          <div
                            className={`text-sm ${expiringSoon ? "text-amber-600 font-medium" : ""}`}
                          >
                            {expiringSoon && <Clock className="w-3 h-3 inline mr-1" />}
                            {new Date(product.expirationDate).toLocaleDateString("pt-BR")}
                            {product.batchNumber && (
                              <div className="text-xs text-muted-foreground">
                                Lote: {product.batchNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">
                          R${" "}
                          {product.unitPrice.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Custo: R${" "}
                          {product.unitCost.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {product.controlledSubstance && (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 text-xs"
                            >
                              Controlado
                            </Badge>
                          )}
                          {product.temperatureControlled && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              Refrigerado
                            </Badge>
                          )}
                          {product.anvisaRegistration && (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              ANVISA
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={product.status === "active" ? "default" : "secondary"}
                          className={
                            product.status === "active"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : product.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {product.status === "active"
                            ? "Ativo"
                            : product.status === "inactive"
                              ? "Inativo"
                              : "Descontinuado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum produto encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

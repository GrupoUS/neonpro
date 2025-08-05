"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCatalog = ProductCatalog;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Mock data for demonstration
var mockProducts = [
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
var categories = [
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
function ProductCatalog() {
  var _a = (0, react_1.useState)(""),
    searchTerm = _a[0],
    setSearchTerm = _a[1];
  var _b = (0, react_1.useState)("all"),
    selectedCategory = _b[0],
    setSelectedCategory = _b[1];
  var _c = (0, react_1.useState)("all"),
    selectedStatus = _c[0],
    setSelectedStatus = _c[1];
  var _d = (0, react_1.useState)("table"),
    viewMode = _d[0],
    setViewMode = _d[1];
  var filteredProducts = (0, react_1.useMemo)(
    function () {
      return mockProducts.filter(function (product) {
        var matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.ncmCode.includes(searchTerm);
        var matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        var matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
      });
    },
    [searchTerm, selectedCategory, selectedStatus],
  );
  var getStockStatus = function (product) {
    if (product.currentStock <= product.minStock) {
      return {
        status: "low",
        color: "text-red-600 bg-red-50 border-red-200",
        icon: lucide_react_1.AlertTriangle,
      };
    }
    if (product.currentStock >= product.maxStock * 0.8) {
      return {
        status: "high",
        color: "text-green-600 bg-green-50 border-green-200",
        icon: lucide_react_1.CheckCircle,
      };
    }
    return {
      status: "normal",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      icon: lucide_react_1.Package,
    };
  };
  var isExpiringSoon = function (expirationDate) {
    if (!expirationDate) return false;
    var expDate = new Date(expirationDate);
    var today = new Date();
    var diffTime = expDate.getTime() - today.getTime();
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input_1.Input
            placeholder="Buscar produtos por nome, marca ou NCM..."
            value={searchTerm}
            onChange={function (e) {
              return setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <select_1.SelectTrigger className="w-48">
            <select_1.SelectValue placeholder="Categoria" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
            {categories.map(function (category) {
              return (
                <select_1.SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </select_1.SelectItem>
              );
            })}
          </select_1.SelectContent>
        </select_1.Select>

        <select_1.Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <select_1.SelectTrigger className="w-32">
            <select_1.SelectValue placeholder="Status" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todos</select_1.SelectItem>
            <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
            <select_1.SelectItem value="inactive">Inativo</select_1.SelectItem>
            <select_1.SelectItem value="discontinued">Descontinuado</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>

        <button_1.Button>
          <lucide_react_1.Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </button_1.Button>
      </div>
      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map(function (category) {
          var categoryCount = mockProducts.filter(function (p) {
            return p.category === category.id && p.status === "active";
          }).length;
          return (
            <card_1.Card
              key={category.id}
              className={"cursor-pointer transition-colors hover:shadow-md ".concat(
                selectedCategory === category.id ? "ring-2 ring-primary" : "",
              )}
              onClick={function () {
                return setSelectedCategory(selectedCategory === category.id ? "all" : category.id);
              }}
            >
              <card_1.CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm mb-1">{category.name}</div>
                <badge_1.Badge variant="outline" className={category.color}>
                  {categoryCount} itens
                </badge_1.Badge>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>{" "}
      {/* Products Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <span>Produtos ({filteredProducts.length})</span>
            <div className="flex items-center gap-2">
              <badge_1.Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <lucide_react_1.Shield className="w-3 h-3 mr-1" />
                ANVISA Compliant
              </badge_1.Badge>
            </div>
          </card_1.CardTitle>
          <card_1.CardDescription>
            Catálogo completo com controle de estoque e compliance regulatório
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="overflow-x-auto">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Produto</table_1.TableHead>
                  <table_1.TableHead>Categoria</table_1.TableHead>
                  <table_1.TableHead>Estoque</table_1.TableHead>
                  <table_1.TableHead>Localização</table_1.TableHead>
                  <table_1.TableHead>Validade</table_1.TableHead>
                  <table_1.TableHead>Preço Unit.</table_1.TableHead>
                  <table_1.TableHead>Compliance</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredProducts.map(function (product) {
                  var stockStatus = getStockStatus(product);
                  var StockIcon = stockStatus.icon;
                  var category = categories.find(function (c) {
                    return c.id === product.category;
                  });
                  var expiringSoon = isExpiringSoon(product.expirationDate);
                  return (
                    <table_1.TableRow key={product.id} className="hover:bg-muted/50">
                      <table_1.TableCell>
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
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <badge_1.Badge
                          variant="outline"
                          className={
                            category === null || category === void 0 ? void 0 : category.color
                          }
                        >
                          {category === null || category === void 0 ? void 0 : category.icon}{" "}
                          {category === null || category === void 0 ? void 0 : category.name}
                        </badge_1.Badge>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          <badge_1.Badge variant="outline" className={stockStatus.color}>
                            <StockIcon className="w-3 h-3 mr-1" />
                            {product.currentStock} {product.unit}
                          </badge_1.Badge>
                          <div className="text-xs text-muted-foreground">
                            Min: {product.minStock}
                          </div>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="flex items-center gap-1">
                          {product.temperatureControlled && (
                            <lucide_react_1.Thermometer className="w-3 h-3 text-blue-500" />
                          )}
                          <span className="text-sm">{product.location}</span>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        {product.expirationDate
                          ? <div
                              className={"text-sm ".concat(
                                expiringSoon ? "text-amber-600 font-medium" : "",
                              )}
                            >
                              {expiringSoon && (
                                <lucide_react_1.Clock className="w-3 h-3 inline mr-1" />
                              )}
                              {new Date(product.expirationDate).toLocaleDateString("pt-BR")}
                              {product.batchNumber && (
                                <div className="text-xs text-muted-foreground">
                                  Lote: {product.batchNumber}
                                </div>
                              )}
                            </div>
                          : <span className="text-muted-foreground text-sm">N/A</span>}
                      </table_1.TableCell>

                      <table_1.TableCell>
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
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="flex flex-col gap-1">
                          {product.controlledSubstance && (
                            <badge_1.Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 text-xs"
                            >
                              Controlado
                            </badge_1.Badge>
                          )}
                          {product.temperatureControlled && (
                            <badge_1.Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              Refrigerado
                            </badge_1.Badge>
                          )}
                          {product.anvisaRegistration && (
                            <badge_1.Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              ANVISA
                            </badge_1.Badge>
                          )}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <badge_1.Badge
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
                        </badge_1.Badge>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  );
                })}
              </table_1.TableBody>
            </table_1.Table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum produto encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}

/**
 * Inventory Management Dashboard Component
 * Main dashboard for real-time inventory tracking and management
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */
"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryDashboard = InventoryDashboard;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var use_inventory_1 = require("@/hooks/inventory/use-inventory");
var inventory_1 = require("@/lib/types/inventory");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_1 = require("react");
var barcode_scanner_1 = require("./barcode-scanner");
function InventoryDashboard(_a) {
  var _this = this;
  var _b = _a.className,
    className = _b === void 0 ? "" : _b;
  var _c = (0, react_1.useState)("items"),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, react_1.useState)(false),
    showScanner = _d[0],
    setShowScanner = _d[1];
  var _e = (0, react_1.useState)("lookup"),
    scanMode = _e[0],
    setScanMode = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedItem = _f[0],
    setSelectedItem = _f[1];
  var _g = (0, use_inventory_1.useInventory)({
      enableRealTime: true,
      autoLoadData: true,
    }),
    state = _g.state,
    isLoading = _g.isLoading,
    isUpdating = _g.isUpdating,
    loadInventoryItems = _g.loadInventoryItems,
    loadCategories = _g.loadCategories,
    loadLocations = _g.loadLocations,
    loadAlerts = _g.loadAlerts,
    refreshData = _g.refreshData,
    updateStock = _g.updateStock,
    scanBarcode = _g.scanBarcode,
    setLocationFilter = _g.setLocationFilter,
    setCategoryFilter = _g.setCategoryFilter,
    setSearchQuery = _g.setSearchQuery,
    connectionStatus = _g.connectionStatus,
    reconnect = _g.reconnect;
  // Handle barcode scan
  var handleBarcodeScan = function (result) {
    return __awaiter(_this, void 0, void 0, function () {
      var scanResult;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("Barcode scanned:", result);
            return [4 /*yield*/, scanBarcode(result.data)];
          case 1:
            scanResult = _a.sent();
            if (scanResult.success && scanResult.item) {
              setSelectedItem(scanResult.item);
              // Handle different scan modes
              switch (scanMode) {
                case "lookup":
                  // Just show item details
                  break;
                case "receive":
                  // TODO: Open receive dialog
                  break;
                case "ship":
                  // TODO: Open shipping dialog
                  break;
                case "adjust":
                  // TODO: Open adjustment dialog
                  break;
              }
            } else {
              // Item not found - could offer to create new item
              console.warn("Item not found:", scanResult.message);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  // Calculate dashboard metrics
  var metrics = react_1.default.useMemo(
    function () {
      var totalItems = state.items.length;
      var lowStockItems = state.alerts.filter(function (alert) {
        return alert.alert_type === "low_stock" || alert.alert_type === "out_of_stock";
      }).length;
      var totalValue = state.items.reduce(function (sum, item) {
        return sum + item.unit_cost * item.current_stock;
      }, 0);
      var activeAlerts = state.alerts.filter(function (alert) {
        return alert.status === "active";
      }).length;
      return {
        totalItems: totalItems,
        lowStockItems: lowStockItems,
        totalValue: totalValue,
        activeAlerts: activeAlerts,
        stockPercentage: totalItems > 0 ? ((totalItems - lowStockItems) / totalItems) * 100 : 100,
      };
    },
    [state.items, state.alerts],
  );
  // Format currency
  var formatCurrency = function (value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  // Get status color
  var getStatusColor = function (status) {
    switch (status) {
      case inventory_1.InventoryStatus.ACTIVE:
        return "bg-green-500";
      case inventory_1.InventoryStatus.INACTIVE:
        return "bg-yellow-500";
      case inventory_1.InventoryStatus.OUT_OF_STOCK:
        return "bg-red-500";
      case inventory_1.InventoryStatus.DISCONTINUED:
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };
  // Get connection status color
  var getConnectionStatusColor = function (status) {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      case "reconnecting":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  return (
    <div className={"inventory-dashboard ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventário</h1>
          <p className="text-gray-500">Gestão em tempo real do estoque e produtos</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Analytics Link */}
          <link_1.default href="/dashboard/inventory/analytics">
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button_1.Button>
          </link_1.default>

          {/* Connection Status */}
          <div
            className={"flex items-center gap-1 text-sm ".concat(
              getConnectionStatusColor(connectionStatus),
            )}
          >
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {connectionStatus === "connected" && "Conectado"}
            {connectionStatus === "disconnected" && "Desconectado"}
            {connectionStatus === "reconnecting" && "Reconectando..."}
            {connectionStatus === "error" && "Erro de Conexão"}
          </div>

          <button_1.Button onClick={refreshData} variant="outline" size="sm" disabled={isLoading}>
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(isLoading ? "animate-spin" : "")}
            />
            Atualizar
          </button_1.Button>

          <dialog_1.Dialog open={showScanner} onOpenChange={setShowScanner}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Scan className="h-4 w-4 mr-2" />
                Scanner
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Scanner de Código de Barras</dialog_1.DialogTitle>
              </dialog_1.DialogHeader>

              <div className="space-y-4">
                <select_1.Select
                  value={scanMode}
                  onValueChange={function (value) {
                    return setScanMode(value);
                  }}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o modo de escaneamento" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="lookup">Consultar Item</select_1.SelectItem>
                    <select_1.SelectItem value="receive">Receber Estoque</select_1.SelectItem>
                    <select_1.SelectItem value="ship">Enviar Estoque</select_1.SelectItem>
                    <select_1.SelectItem value="adjust">Ajustar Estoque</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>

                <barcode_scanner_1.BarcodeScanner
                  onScan={handleBarcodeScan}
                  continuous={true}
                  showHistory={true}
                  autoStart={true}
                />
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold">{metrics.totalItems}</p>
              </div>
              <lucide_react_1.Package className="h-8 w-8 text-blue-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.lowStockItems}</p>
              </div>
              <lucide_react_1.AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.totalValue)}
                </p>
              </div>
              <lucide_react_1.TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                <p className="text-2xl font-bold text-red-600">{metrics.activeAlerts}</p>
              </div>
              <lucide_react_1.AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Stock Health */}
      <card_1.Card className="mb-6">
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Saúde do Estoque</h3>
            <badge_1.Badge variant={metrics.stockPercentage >= 80 ? "default" : "destructive"}>
              {metrics.stockPercentage.toFixed(1)}%
            </badge_1.Badge>
          </div>
          <progress_1.Progress value={metrics.stockPercentage} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            {metrics.totalItems - metrics.lowStockItems} de {metrics.totalItems} itens com estoque
            adequado
          </p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Active Alerts */}
      {state.alerts.length > 0 && (
        <card_1.Card className="mb-6">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-5 w-5" />
              Alertas Ativos ({state.alerts.length})
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-2">
              {state.alerts.slice(0, 5).map(function (alert) {
                return (
                  <alert_1.Alert key={alert.id} variant="destructive">
                    <alert_1.AlertDescription className="flex items-center justify-between">
                      <span>{alert.message}</span>
                      <badge_1.Badge variant="outline">{alert.alert_type}</badge_1.Badge>
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                );
              })}
              {state.alerts.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  E mais {state.alerts.length - 5} alertas...
                </p>
              )}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="items">Itens</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="movements">Movimentações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="locations">Locais</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="categories">Categorias</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Relatórios</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Items Tab */}
        <tabs_1.TabsContent value="items" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Itens do Inventário</card_1.CardTitle>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-64">
                  <input_1.Input
                    placeholder="Buscar itens..."
                    value={state.searchQuery || ""}
                    onChange={function (e) {
                      return setSearchQuery(e.target.value);
                    }}
                    className="w-full"
                  />
                </div>

                <select_1.Select
                  value={state.selectedLocation || ""}
                  onValueChange={setLocationFilter}
                >
                  <select_1.SelectTrigger className="w-48">
                    <select_1.SelectValue placeholder="Filtrar por local" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="">Todos os locais</select_1.SelectItem>
                    {state.locations.map(function (location) {
                      return (
                        <select_1.SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>

                <select_1.Select
                  value={state.selectedCategory || ""}
                  onValueChange={setCategoryFilter}
                >
                  <select_1.SelectTrigger className="w-48">
                    <select_1.SelectValue placeholder="Filtrar por categoria" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="">Todas as categorias</select_1.SelectItem>
                    {state.categories.map(function (category) {
                      return (
                        <select_1.SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>

                <button_1.Button>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </button_1.Button>
              </div>
            </card_1.CardHeader>

            <card_1.CardContent>
              {isLoading
                ? <div className="flex items-center justify-center py-8">
                    <lucide_react_1.RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Carregando itens...
                  </div>
                : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.items.map(function (item) {
                      return (
                        <card_1.Card key={item.id} className="hover:shadow-md transition-shadow">
                          <card_1.CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold truncate">{item.name}</h4>
                              <div
                                className={"w-3 h-3 rounded-full ".concat(
                                  getStatusColor(item.status),
                                )}
                              />
                            </div>

                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                            <div className="flex items-center justify-between text-sm">
                              <span>
                                Estoque: <strong>{item.current_stock}</strong>
                              </span>
                              <span>Min: {item.minimum_stock}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm mt-2">
                              <span>{formatCurrency(item.unit_cost)}</span>
                              <badge_1.Badge variant="outline">
                                {item.unit_of_measure}
                              </badge_1.Badge>
                            </div>

                            {item.barcode && (
                              <div className="mt-2 text-xs text-gray-500 font-mono">
                                {item.barcode}
                              </div>
                            )}
                          </card_1.CardContent>
                        </card_1.Card>
                      );
                    })}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Other tabs content would go here */}
        <tabs_1.TabsContent value="movements">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Movimentações de Estoque</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <p className="text-gray-500">Movimentações em desenvolvimento...</p>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="locations">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Locais de Armazenamento</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.locations.map(function (location) {
                  return (
                    <card_1.Card key={location.id}>
                      <card_1.CardContent className="p-4">
                        <h4 className="font-semibold">{location.name}</h4>
                        <p className="text-sm text-gray-600">{location.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <lucide_react_1.MapPin className="h-3 w-3" />
                          {location.location_type}
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="categories">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Categorias</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.categories.map(function (category) {
                  return (
                    <card_1.Card key={category.id}>
                      <card_1.CardContent className="p-4">
                        <h4 className="font-semibold">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <lucide_react_1.Tags className="h-3 w-3" />
                          Categoria
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="reports">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Relatórios e Análises</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <p className="text-gray-500">Relatórios em desenvolvimento...</p>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
exports.default = InventoryDashboard;

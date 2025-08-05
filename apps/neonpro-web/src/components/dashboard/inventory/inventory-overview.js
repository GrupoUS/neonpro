// =====================================================================================
// NeonPro Inventory Dashboard Overview Component
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================
"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InventoryOverview;
var client_1 = require("@/app/utils/supabase/client");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
// =====================================================================================
// MAIN COMPONENT
// =====================================================================================
function InventoryOverview() {
    var _this = this;
    var _a = (0, react_1.useState)([]), items = _a[0], setItems = _a[1];
    var _b = (0, react_1.useState)({
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0,
    }), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(""), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = (0, react_1.useState)("all"), categoryFilter = _e[0], setCategoryFilter = _e[1];
    var _f = (0, react_1.useState)("active"), statusFilter = _f[0], setStatusFilter = _f[1];
    var _g = (0, react_1.useState)(false), showLowStock = _g[0], setShowLowStock = _g[1];
    var supabase = (0, client_1.createClient)();
    // =====================================================================================
    // DATA FETCHING
    // =====================================================================================
    var fetchInventoryData = function () { return __awaiter(_this, void 0, void 0, function () {
        var params, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    params = new URLSearchParams({
                        search: searchTerm,
                        status: statusFilter,
                        lowStock: showLowStock.toString(),
                        limit: "50",
                    });
                    if (categoryFilter !== "all") {
                        params.append("category", categoryFilter);
                    }
                    return [4 /*yield*/, fetch("/api/inventory/items?".concat(params))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch inventory data");
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setItems(data.items || []);
                    // Calculate stats
                    calculateStats(data.items || []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error fetching inventory data:", error_1);
                    sonner_1.toast.error("Failed to load inventory data");
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var calculateStats = function (inventoryItems) {
        var stats = inventoryItems.reduce(function (acc, item) {
            var _a;
            var totalStock = ((_a = item.stock_levels) === null || _a === void 0 ? void 0 : _a.reduce(function (sum, level) { return sum + level.available_quantity; }, 0)) || 0;
            var itemValue = (item.cost || 0) * totalStock;
            acc.totalItems += 1;
            acc.totalValue += itemValue;
            if (totalStock === 0) {
                acc.outOfStockItems += 1;
            }
            else if (totalStock <= item.reorder_level) {
                acc.lowStockItems += 1;
            }
            return acc;
        }, {
            totalItems: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
            totalValue: 0,
        });
        setStats(stats);
    };
    // =====================================================================================
    // EFFECTS
    // =====================================================================================
    (0, react_1.useEffect)(function () {
        fetchInventoryData();
    }, [searchTerm, categoryFilter, statusFilter, showLowStock]);
    // =====================================================================================
    // UTILITY FUNCTIONS
    // =====================================================================================
    var getStockStatus = function (item) {
        var _a;
        var totalStock = ((_a = item.stock_levels) === null || _a === void 0 ? void 0 : _a.reduce(function (sum, level) { return sum + level.available_quantity; }, 0)) || 0;
        if (totalStock === 0) {
            return {
                status: "out-of-stock",
                color: "destructive",
                text: "Out of Stock",
            };
        }
        else if (totalStock <= item.reorder_level) {
            return { status: "low-stock", color: "warning", text: "Low Stock" };
        }
        else {
            return { status: "in-stock", color: "success", text: "In Stock" };
        }
    };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };
    // =====================================================================================
    // RENDER
    // =====================================================================================
    return (<div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Items</card_1.CardTitle>
            <lucide_react_1.Package className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Low Stock</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-warning"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items need reordering
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Out of Stock</card_1.CardTitle>
            <lucide_react_1.Package className="h-4 w-4 text-destructive"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.outOfStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Value</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filters and Search */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <span>Inventory Items</span>
            <div className="flex items-center space-x-2">
              <button_1.Button variant="outline" size="sm" onClick={function () { return fetchInventoryData(); }}>
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-1"/>
                Refresh
              </button_1.Button>
              <button_1.Button size="sm">
                <lucide_react_1.Plus className="h-4 w-4 mr-1"/>
                Add Item
              </button_1.Button>
            </div>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Search items by name, SKU, or barcode..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
              </div>
            </div>
            <div className="flex gap-2">
              <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="active">Active</select_1.SelectItem>
                  <select_1.SelectItem value="inactive">Inactive</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
              <button_1.Button variant={showLowStock ? "default" : "outline"} size="sm" onClick={function () { return setShowLowStock(!showLowStock); }}>
                <lucide_react_1.Filter className="h-4 w-4 mr-1"/>
                Low Stock
              </button_1.Button>
            </div>
          </div>

          {/* Items List */}
          {loading ? (<div className="text-center py-8">
              <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2"/>
              <p>Loading inventory...</p>
            </div>) : items.length === 0 ? (<div className="text-center py-8">
              <lucide_react_1.Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground"/>
              <p className="text-lg font-medium">No items found</p>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>) : (<div className="space-y-2">
              {items.map(function (item) {
                var _a;
                var stockStatus = getStockStatus(item);
                var totalStock = ((_a = item.stock_levels) === null || _a === void 0 ? void 0 : _a.reduce(function (sum, level) { return sum + level.available_quantity; }, 0)) || 0;
                return (<div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>SKU: {item.sku}</span>
                              {item.barcode && (<span className="flex items-center">
                                  <lucide_react_1.Barcode className="h-3 w-3 mr-1"/>
                                  {item.barcode}
                                </span>)}
                              <span>Unit: {item.unit}</span>
                              {item.category && (<badge_1.Badge variant="outline">
                                  {item.category.name}
                                </badge_1.Badge>)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">
                            {totalStock} {item.unit}
                          </div>
                          <badge_1.Badge variant={stockStatus.color}>
                            {stockStatus.text}
                          </badge_1.Badge>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.Eye className="h-4 w-4"/>
                          </button_1.Button>
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.Edit className="h-4 w-4"/>
                          </button_1.Button>
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.Archive className="h-4 w-4"/>
                          </button_1.Button>
                        </div>
                      </div>
                    </div>
                  </div>);
            })}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}

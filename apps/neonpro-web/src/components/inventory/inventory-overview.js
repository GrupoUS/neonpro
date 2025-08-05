'use client';
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
exports.InventoryOverview = InventoryOverview;
/**
 * Story 11.3: Inventory Overview Component
 * Comprehensive inventory overview with alerts, stock levels, and quick actions
 */
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var icons_1 = require("@/components/ui/icons");
var table_1 = require("@/components/ui/table");
function InventoryOverview(_a) {
    var _this = this;
    var dashboardData = _a.dashboardData, onRefresh = _a.onRefresh, className = _a.className;
    var _b = (0, react_1.useState)([]), alerts = _b[0], setAlerts = _b[1];
    var _c = (0, react_1.useState)([]), lowStockProducts = _c[0], setLowStockProducts = _c[1];
    var _d = (0, react_1.useState)([]), expiringProducts = _d[0], setExpiringProducts = _d[1];
    var _e = (0, react_1.useState)(false), isLoadingDetails = _e[0], setIsLoadingDetails = _e[1];
    (0, react_1.useEffect)(function () {
        if (dashboardData) {
            loadDetailedData();
        }
    }, [dashboardData]);
    var loadDetailedData = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoadingDetails(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    // Simulate loading detailed data
                    // In real implementation, these would be separate API calls
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // Simulate loading detailed data
                    // In real implementation, these would be separate API calls
                    _a.sent();
                    // Mock alerts data
                    setAlerts([
                        {
                            id: '1',
                            type: 'low_stock',
                            product_name: 'Luvas de Procedimento',
                            message: 'Estoque baixo - apenas 45 unidades restantes',
                            severity: 'medium',
                            action_required: 'Reabastecer estoque',
                            created_at: new Date()
                        },
                        {
                            id: '2',
                            type: 'expiry',
                            product_name: 'Soro Fisiológico 500ml',
                            message: 'Lote vencendo em 5 dias',
                            severity: 'high',
                            action_required: 'Usar prioritariamente',
                            created_at: new Date()
                        },
                        {
                            id: '3',
                            type: 'out_of_stock',
                            product_name: 'Seringas 5ml',
                            message: 'Produto em falta',
                            severity: 'critical',
                            action_required: 'Compra urgente',
                            created_at: new Date()
                        }
                    ]);
                    // Mock low stock products
                    setLowStockProducts([
                        {
                            id: '1',
                            name: 'Luvas de Procedimento',
                            current_stock: 45,
                            minimum_stock: 100,
                            percentage: 45,
                            status: 'low'
                        },
                        {
                            id: '2',
                            name: 'Máscaras Cirúrgicas',
                            current_stock: 78,
                            minimum_stock: 200,
                            percentage: 39,
                            status: 'critical'
                        },
                        {
                            id: '3',
                            name: 'Gaze Estéril',
                            current_stock: 23,
                            minimum_stock: 50,
                            percentage: 46,
                            status: 'low'
                        }
                    ]);
                    // Mock expiring products
                    setExpiringProducts([
                        {
                            id: '1',
                            name: 'Soro Fisiológico 500ml',
                            batch_number: 'LT20241201',
                            expiry_date: new Date('2024-12-10'),
                            days_to_expiry: 5,
                            quantity: 120,
                            value: 2400
                        },
                        {
                            id: '2',
                            name: 'Medicamento X',
                            batch_number: 'LT20241205',
                            expiry_date: new Date('2024-12-15'),
                            days_to_expiry: 10,
                            quantity: 30,
                            value: 1500
                        }
                    ]);
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoadingDetails(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getSeverityColor = function (severity) {
        var colors = {
            low: 'bg-blue-100 text-blue-800 border-blue-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            critical: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[severity] || colors.low;
    };
    var getStockStatusColor = function (percentage) {
        if (percentage <= 25)
            return 'bg-red-500';
        if (percentage <= 50)
            return 'bg-orange-500';
        if (percentage <= 75)
            return 'bg-yellow-500';
        return 'bg-green-500';
    };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    if (!dashboardData) {
        return (<div className={"space-y-6 ".concat(className)}>
        <div className="text-center py-8">
          <icons_1.Icons.Package className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </div>);
    }
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Alert Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.AlertTriangle className="h-5 w-5"/>
              Alertas Ativos
            </card_1.CardTitle>
            <card_1.CardDescription>
              Situações que requerem atenção imediata
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            {isLoadingDetails ? (<div className="space-y-3">
                {[1, 2, 3].map(function (i) { return (<div key={i} className="h-12 bg-gray-200 rounded animate-pulse"/>); })}
              </div>) : alerts.length > 0 ? (<div className="space-y-3">
                {alerts.map(function (alert) { return (<div key={alert.id} className={"p-3 rounded-lg border ".concat(getSeverityColor(alert.severity))}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{alert.product_name}</p>
                        <p className="text-sm opacity-90">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">{alert.action_required}</p>
                      </div>
                      <badge_1.Badge variant="outline" className="ml-2">
                        {alert.severity}
                      </badge_1.Badge>
                    </div>
                  </div>); })}
              </div>) : (<div className="text-center py-4">
                <icons_1.Icons.CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2"/>
                <p className="text-sm text-muted-foreground">Nenhum alerta ativo</p>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <icons_1.Icons.TrendingDown className="h-5 w-5"/>
              Produtos com Estoque Baixo
            </card_1.CardTitle>
            <card_1.CardDescription>
              Produtos próximos ao estoque mínimo
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            {isLoadingDetails ? (<div className="space-y-3">
                {[1, 2, 3].map(function (i) { return (<div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"/>
                    <div className="h-2 bg-gray-200 rounded animate-pulse"/>
                  </div>); })}
              </div>) : lowStockProducts.length > 0 ? (<div className="space-y-4">
                {lowStockProducts.map(function (product) { return (<div key={product.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.current_stock}/{product.minimum_stock}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <progress_1.Progress value={product.percentage} className="h-2"/>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{product.percentage}% do mínimo</span>
                        <badge_1.Badge variant={product.status === 'critical' ? 'destructive' : 'secondary'}>
                          {product.status === 'critical' ? 'Crítico' : 'Baixo'}
                        </badge_1.Badge>
                      </div>
                    </div>
                  </div>); })}
              </div>) : (<div className="text-center py-4">
                <icons_1.Icons.CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2"/>
                <p className="text-sm text-muted-foreground">Todos os estoques adequados</p>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Stock Value Summary */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <icons_1.Icons.DollarSign className="h-5 w-5"/>
            Valor do Estoque
          </card_1.CardTitle>
          <card_1.CardDescription>
            Distribuição de valor por categoria e status
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.stock_levels.total_value)}
              </div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardData.cost_efficiency.monthly_consumption_value)}
              </div>
              <p className="text-sm text-muted-foreground">Consumo Mensal</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(dashboardData.cost_efficiency.potential_savings)}
              </div>
              <p className="text-sm text-muted-foreground">Economia Potencial</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Expiring Products */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <icons_1.Icons.Clock className="h-5 w-5"/>
            Produtos Próximos ao Vencimento
          </card_1.CardTitle>
          <card_1.CardDescription>
            Lotes que vencem nos próximos 30 dias
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {isLoadingDetails ? (<div className="h-48 bg-gray-200 rounded animate-pulse"/>) : expiringProducts.length > 0 ? (<table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Produto</table_1.TableHead>
                  <table_1.TableHead>Lote</table_1.TableHead>
                  <table_1.TableHead>Vencimento</table_1.TableHead>
                  <table_1.TableHead>Dias</table_1.TableHead>
                  <table_1.TableHead>Quantidade</table_1.TableHead>
                  <table_1.TableHead>Valor</table_1.TableHead>
                  <table_1.TableHead>Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {expiringProducts.map(function (product) { return (<table_1.TableRow key={product.id}>
                    <table_1.TableCell className="font-medium">{product.name}</table_1.TableCell>
                    <table_1.TableCell>{product.batch_number}</table_1.TableCell>
                    <table_1.TableCell>
                      {product.expiry_date.toLocaleDateString('pt-BR')}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant={product.days_to_expiry <= 7 ? 'destructive' : 'secondary'}>
                        {product.days_to_expiry} dias
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>{product.quantity}</table_1.TableCell>
                    <table_1.TableCell>{formatCurrency(product.value)}</table_1.TableCell>
                    <table_1.TableCell>
                      <button_1.Button size="sm" variant="outline">
                        <icons_1.Icons.ArrowRight className="h-4 w-4 mr-1"/>
                        Usar
                      </button_1.Button>
                    </table_1.TableCell>
                  </table_1.TableRow>); })}
              </table_1.TableBody>
            </table_1.Table>) : (<div className="text-center py-8">
              <icons_1.Icons.CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4"/>
              <p className="text-muted-foreground">Nenhum produto próximo ao vencimento</p>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Quick Actions */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <icons_1.Icons.Zap className="h-5 w-5"/>
            Ações Rápidas
          </card_1.CardTitle>
          <card_1.CardDescription>
            Operações frequentes do sistema de estoque
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
              <icons_1.Icons.Plus className="h-5 w-5"/>
              Nova Saída
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
              <icons_1.Icons.ArrowUpDown className="h-5 w-5"/>
              Transferência
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
              <icons_1.Icons.BarChart3 className="h-5 w-5"/>
              Relatório
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex flex-col gap-2" onClick={onRefresh}>
              <icons_1.Icons.RefreshCw className="h-5 w-5"/>
              Atualizar
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
